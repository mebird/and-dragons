import { IntegrationEnum } from '../integrations/IIntegration';
import { Course, Student, CachedScore, Score } from './DataTypes';

export interface IDataClient {
  /**
   * This will close the connection with the db.
   *
   * Do not call unless you know what you're doing.
   * We're using a single connection for a majority of this.
   */
  destroy: () => void;

  /**
   * Standard SQL queries.
   */
  query: (query: string) => Promise<any>;

  /**
   * Adds a course & returns the course id. Provide all fields for the course object except for id.
   */
  addCourse: (course: Omit<Course, 'course_id'>) => Promise<number>;

  /**
   * Gets the course with the given ID
   */
  getCourse: (courseId: number) => Promise<Course>;

  /**
   * Updates the last PL date for this course
   */
  updateCourseLastPL: (course_id: number, date: Date) => Promise<void>;

  /**
   * Gets all active courses
   */
  getCourses: () => Promise<Course[]>;

  /**
   * Adds a student & returns their id. Provide all fields from the student object except for id.
   */
  addStudent: (
    student: Omit<Student, 'student_id' | 'last_seen'>
  ) => Promise<number>;

  /**
   * Updates a student's id for a given integration
   */
  updateStudent: (
    id: number,
    integration: IntegrationEnum,
    value: string
  ) => Promise<void>;

  /**
   * Deletes a student.
   */
  deleteStudent: (studentId: number) => Promise<void>;

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
    integration?: IntegrationEnum
  ) => Promise<CachedScore[]>;

  /**
   * Returns all score associated with the given student.
   */
  getScoresByStudent: (
    studentId: number,
    integration?: IntegrationEnum
  ) => Promise<Score[]>;

  /**
   * Returns all cached scores associated with the given course ID and integration.
   */
  getCachedScoresByCourse: (
    courseId: number,
    integration?: IntegrationEnum
  ) => Promise<CachedScore[]>;

  /**
   * Returns all scores associated with a given course & integration.
   */
  getScoresByCourse: (
    courseId: number,
    integration?: IntegrationEnum
  ) => Promise<Score[]>;

  /**
   * Updates the given student's score for the given integration
   * by x points, and returns the updated score value.
   * @param studentId The student's ID
   * @param integration The destination integration
   * @param points The number of points to increase/decrease the student's score by
   */
  updateScore: (
    studentId: number,
    integration: IntegrationEnum,
    points: number
  ) => Promise<number>;
}

export default IDataClient;
