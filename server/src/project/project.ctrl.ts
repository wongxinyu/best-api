import { ProjectModel, ProjectInterface } from './project.md'
import { Observable } from 'rxjs/Rx'

export interface projectGet extends ProjectInterface {
  _id?: string,
  id: string,
  name: string,
  api: {
    total: number,
    pass: number,
    untest: number
  }
}

export enum role {
  g = 'guest',
  m = 'master',
  d = 'developer',
}

export interface projectPost extends ProjectInterface {
  name: string,
  description?: string,
  testAddress: string,
  members: [{
    id: string,
    name: string,
    role: role
  }]
}

export interface projectPut {
  id: string,
  name?: string
}

export const projectCtrl = {
  get() {
    return Observable.fromPromise(ProjectModel.aggregate([{
      $project: {
        id: '$_id',
        name: 1
      }
    }]))
    .switchMap((x: projectGet[]) => Observable.from(x))
    .map((p: projectGet) => ({
        api: {
          total: 0,
          pass: 0,
          untest: 0
        }
      }))
      .toArray()
      .map((x: projectGet[]) => ({
        total: x.length,
        list: x
      }))
  },
  getById(id: string) {
    return Observable.fromPromise(ProjectModel.findOne({ _id: id }))
      .map((res:any) => {
        return {
          id: res._id,
          name: res.name,
          description: res.desc,
          testUrl: res.testUrl,
          openTest: res.openTest,
          apiChangedInform: res.apiChangedInform,
          testFailedInform: res.testFailedInform,
          members: res.memberList
        }
      })
  },
  post(project: any) {
    return Observable.fromPromise((new ProjectModel(project)).save())
      .map((proj: ProjectInterface) => ({ id: proj._id }))
  },
  put(project: projectPut) {
    return Observable.fromPromise(
      new Promise((res, rej) => {
        ProjectModel.updateOne({ _id: project.id }, project, (e: any, r: any) => {
          e ? rej(e) : res(r.n)
        })
      }))
  },
  del(id: string) {
    return Observable.fromPromise(ProjectModel.remove({ _id: id }))
      .map((res: any) => ({ 
        num: res.result.n 
      }))
  }
}