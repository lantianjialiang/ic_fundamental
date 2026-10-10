export type ModuleId =
  | 'intro'
  | 'connection'
  | 'ate'
  | 'pmu'
  | 'spec'
  | 'dc'
  | 'func'
  | 'timing'
  | 'ac'
  | 'vector'
  | 'scan'
  | 'program'
  | 'debug'
  | 'shmoo'
  | 'alu'
  | 'latch'
  | 'bench'
  | 'fSpec'
  | 'fOpens'
  | 'fDc'
  | 'fFunc'
  | 'fAc'

export const MODULES: Array<{
  id: ModuleId
  code: string
  title: string
}> = [
  { id: 'intro', code: '01', title: 'What is semiconductor test?' },
  { id: 'connection', code: '02', title: 'How is a DUT connected to an ATE?' },
  { id: 'ate', code: '03', title: 'What is inside an ATE?' },
  { id: 'pmu', code: '04', title: 'Why test is more than 0 and 1' },
  { id: 'spec', code: '05', title: 'From datasheet to test spec' },
  { id: 'dc', code: '06', title: 'DC Test' },
  { id: 'func', code: '07', title: 'Functional Test' },
  { id: 'timing', code: '08', title: 'Timing' },
  { id: 'ac', code: '09', title: 'AC Parameters' },
  { id: 'vector', code: '10', title: 'Test Vector Development' },
  { id: 'scan', code: '11', title: 'Scan Test' },
  { id: 'program', code: '12', title: 'Test Program Development' },
  { id: 'debug', code: '13', title: 'Why the program does not work' },
  { id: 'shmoo', code: '14', title: 'Yield, characterization, Shmoo' },
  { id: 'alu', code: '15', title: '4-bit ALU test program' },
  { id: 'latch', code: '16', title: 'Latch-up entry' },
  { id: 'bench', code: '17', title: 'Interactive bench' },
  { id: 'fSpec', code: '18', title: 'Device specifications' },
  { id: 'fOpens', code: '19', title: 'Opens / shorts' },
  { id: 'fDc', code: '20', title: 'DC parameters' },
  { id: 'fFunc', code: '21', title: 'Functional testing' },
  { id: 'fAc', code: '22', title: 'AC parameters' },
]
