type SmallTeacher = {
  id: string,
  forename: string,
  lastname: string
}

type SmallGrade = {
  id: string,
  grade: string,
  subgrade: string
}

type SmallClass = {
  id: string,
  name: string,
  weekday: string,
  gradeId: string,
  grade: string,
  subgrade: string
}

type SmallStudent = {
  id: string,
  forename: string,
  lastname: string,
  grade: string
}

export { SmallTeacher, SmallGrade, SmallClass, SmallStudent }