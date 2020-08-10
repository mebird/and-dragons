import mysql, { Connection } from 'promise-mysql';
import IDataClient, {
  Student,
  Integration,
  CachedScore,
  Score,
  Course,
} from './IDataClient';

class DataClient implements IDataClient {
  private static client: DataClient;
  private connection: Connection;

  private async init(
    host: string = '',
    username: string = process.env.DB_USERNAME,
    password: string = process.env.DB_PASSWORD
  ) {
    this.connection = await mysql.createConnection({
      host,
      password,
      user: username,
    });
  }
  /**
   * Returns a dataclient to the specified MySQL Database.
   * If client hasn't been initialized, and parameters are not provided, uses:
   * DB_HOST
   * DB_USERNAME
   * DB_PASSWORD
   * @param host
   * @param username
   * @param password
   */
  public static async getClient(
    host: string = '',
    username: string = process.env.DB_USERNAME,
    password: string = process.env.DB_PASSWORD
  ): Promise<IDataClient> {
    if (!DataClient.client) {
      const client = new DataClient();
      await client.init(host, username, password);
      DataClient.client = client;
    }
    return DataClient.client;
  }

  public async addCourse(course: Course): Promise<Course> {
    throw new Error('Not implemented');
  }

  public async addStudent(student: Student): Promise<Student> {
    throw new Error('Not implemented');
  }

  public async deleteStudent(studentId: number): Promise<Student> {
    throw new Error('Not implemented');
  }

  public async getStudents(student: Partial<Student>): Promise<Student[]> {
    throw new Error('Not implemented');
  }

  public async getStudentsByCourse(courseId: number): Promise<Student[]> {
    throw new Error('Not implemented');
  }

  public async getCachedScoresByStudent(
    studentId: number,
    integration?: Integration
  ): Promise<CachedScore[]> {
    throw new Error('Not implemented');
  }

  public async getScoresByStudent(
    studentId: number,
    integration?: Integration
  ): Promise<Score[]> {
    throw new Error('Not implemented');
  }

  public async getCachedScoresByCourse(
    courseId: number,
    integration?: Integration
  ): Promise<CachedScore[]> {
    throw new Error('Not implemented');
  }

  public async getScoresByCourse(
    courseId: number,
    integration?: Integration
  ): Promise<Score[]> {
    throw new Error('Not implemented');
  }

  public async updateScore(
    studentId: number,
    integration: Integration,
    points: number
  ): Promise<Score> {
    throw new Error('Not implemented');
  }
}

export default DataClient;
