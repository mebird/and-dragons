import mysql, { Connection, escape, format, ConnectionConfig } from 'mysql';
import IDataClient, {
  Student,
  Integration,
  CachedScore,
  Score,
  Course,
} from './IDataClient';
import { isUndefined } from 'lodash';

const coursesTable = 'courses';
const studentsTable = 'students';
const scoresTable = 'points';
const scoresCacheTable = 'points_cache';
const integrationsTable = 'integrations';

class DataClient implements IDataClient {
  private static client: DataClient;
  private connection: Connection;

  private async init(
    host: string = process.env.DB_HOST,
    database: string = process.env.DB_DATABASE,
    username: string = process.env.DB_USERNAME,
    password: string = process.env.DB_PASSWORD
  ) {
    const config: ConnectionConfig = {
      multipleStatements: true,
      insecureAuth: true,
      host,
      password,
      user: username,
      database,
    };
    console.log(config);
    this.connection = mysql.createConnection(config);
    this.connection.connect();
  }
  /**
   * Returns a dataclient to the specified MySQL Database.
   * Uses DB_* env variables as outlined in .env
   */
  public static async getClient(): Promise<IDataClient> {
    if (!DataClient.client) {
      const client = new DataClient();
      await client.init();
      DataClient.client = client;
    }
    return DataClient.client;
  }

  private toFieldsString(obj: object) {
    return `(${Object.keys(obj).join(',')})`;
  }

  private toValuesString(obj: object) {
    return `(${Object.values(obj)
      .map(v => escape(v))
      .join(',')})`;
  }

  private toWhereQuery(obj: object) {
    return Object.entries(obj)
      .map(([key, value]) => `${key} = ${escape(value)}`)
      .join(' AND ');
  }

  private async query(query: string): Promise<any> {
    console.log(query);
    const res = await new Promise((resolve, reject) =>
      this.connection.query(query, (error, results) => {
        if (error) reject(error);
        resolve(results);
      })
    );
    return res;
  }

  public async addCourse(course: Omit<Course, 'course_id'>): Promise<number> {
    const queryStr = `INSERT INTO ${coursesTable} ${this.toFieldsString(
      course
    )} VALUES ${this.toValuesString(course)}`;
    const res = await this.query(queryStr);
    return res.insertId;
  }

  private async initScores(studentId: number, table: string) {
    const queryStr = `INSERT INTO ${table} (student_id, integration_id) SELECT ${escape(
      studentId
    )}, integration_id FROM ${integrationsTable}`;
    await this.query(queryStr);
  }

  public destroy() {
    this.connection.end();
  }

  public async addStudent(
    student: Omit<Student, 'student_id' | 'last_seen'>
  ): Promise<number> {
    const queryStr = `INSERT INTO ${studentsTable} ${this.toFieldsString(
      student
    )} VALUES ${this.toValuesString(student)}`;
    const res = await this.query(queryStr);
    const { insertId } = res;
    await this.initScores(insertId, scoresTable);
    await this.initScores(insertId, scoresCacheTable);
    return insertId;
  }

  public async deleteStudent(studentId: number): Promise<Student> {
    const queryStr = `DELETE FROM ${studentsTable} WHERE student_id = ${studentId}`;
    return this.query(queryStr);
  }

  public async getStudents(student: Partial<Student>): Promise<Student[]> {
    const queryStr = `SELECT * FROM ${studentsTable} WHERE ${this.toWhereQuery(
      student
    )}`;
    return this.query(queryStr);
  }

  public async getStudentsByCourse(courseId: number): Promise<Student[]> {
    const queryStr = `SELECT * FROM ${studentsTable} WHERE course_id = ${courseId}`;
    return this.query(queryStr);
  }

  public async getCachedScoresByStudent(
    studentId: number,
    integration?: Integration
  ): Promise<CachedScore[]> {
    let queryStr = `SELECT * FROM ${scoresCacheTable} WHERE student_id = ${studentId}`;
    if (!isUndefined(integration)) {
      queryStr += ` AND integration_id = ${integration}`;
    }
    return this.query(queryStr);
  }

  public async getScoresByStudent(
    studentId: number,
    integration?: Integration
  ): Promise<Score[]> {
    let queryStr = `SELECT * FROM ${scoresTable} WHERE student_id = ${studentId}`;
    if (!isUndefined(integration)) {
      queryStr += ` AND integration_id = ${integration}`;
    }
    return this.query(queryStr);
  }

  private async queryScoresByCourse<T>(
    table: string,
    courseId: number,
    integration?: Integration
  ): Promise<T[]> {
    let queryStr = `SELECT * FROM ${table} sc 
                      LEFT JOIN ${studentsTable} s ON sc.student_id = s.student_id
                      WHERE s.course_id = ${courseId}`;
    if (!isUndefined(integration)) {
      queryStr += ` AND integration_id = ${integration}`;
    }
    return this.query(queryStr);
  }

  public async getCachedScoresByCourse(
    courseId: number,
    integration?: Integration
  ): Promise<CachedScore[]> {
    return this.queryScoresByCourse<CachedScore>(
      scoresCacheTable,
      courseId,
      integration
    );
  }

  public async getScoresByCourse(
    courseId: number,
    integration?: Integration
  ): Promise<Score[]> {
    return this.queryScoresByCourse<CachedScore>(
      scoresTable,
      courseId,
      integration
    );
  }

  public async updateScore(
    studentId: number,
    integration: Integration,
    points: number
  ): Promise<number> {
    const queryStr = `UPDATE ${scoresTable} SET points = @points := points + ${points} WHERE integration_id = ${escape(
      integration
    )} AND student_id = ${studentId}; SELECT @points;`;
    const res = await this.query(queryStr);
    return res[1][0]['@points'];
  }
}

export default DataClient;
