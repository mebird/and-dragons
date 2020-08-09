export interface Student {
  student_id: number;
  course_id: number;
  last_seen: Date;
  pl_id: string;
  discord_id: string;
  piazza_id: string;
}

export interface Course {
  course_id: number;
  pl_course_id: number;
}

export enum Integration {
  PL = 'PL',
  DISCORD = 'DISCORD',
  PIAZZA = 'PIAZZA',
}

export interface Score {
  student_id: number;
  integration: string;
  points: number;
}

export interface CachedScore extends Score {
  timestamp: Date;
}

export interface IDataClient {
  /**
   * Given a set of attributes for a student, returns
   * the all student that match the given query.
   *
   * Note that two "students" with the same ID can have different
   * course codes. Please provide the course code if you care about
   * specificity.
   */
  getStudents: (student: Partial<Student>) => Promise<Student[]>;

  /**
   * Returns all students in the given course.
   */
  getStudentsByCourse: (courseId: number) => Promise<Student[]>;

  /**
   * Returns all cached scores associated with the given student.
   */
  getCachedScoresByStudent: (
    studentId: number,
    integration?: Integration
  ) => Promise<CachedScore[]>;

  /**
   * Returns all score associated with the given student.
   */
  getScoresByStudent: (
    studentId: number,
    integration?: Integration
  ) => Promise<Score[]>;

  /**
   * Returns all cached scores associated with the given course ID and integration.
   */
  getCachedScoresByCourse: (
    courseId: number,
    integration?: Integration
  ) => Promise<CachedScore[]>;

  /**
   * Returns all scores associated with a given course & integration.
   */
  getScoresByCourse: (
    courseId: number,
    integration?: Integration
  ) => Promise<Score[]>;

  /**
   * Updates the given student's score for the given integration
   * by x points, and returns the updated score.
   * @param studentId The student's ID
   * @param integration The destination integration
   * @param points The number of points to increase/decrease the student's score by
   */
  updateScore: (
    studentId: number,
    integration: Integration,
    points: number
  ) => Promise<Score>;
}

export default IDataClient;