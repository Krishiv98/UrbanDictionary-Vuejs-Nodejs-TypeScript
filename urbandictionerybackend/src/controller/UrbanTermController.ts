import { AppDataSource } from '../data-source'
import { NextFunction, Request, Response } from 'express'
import { UrbanTerm } from '../entity/UrbanTerm'
import { Controller } from '../decorator/Controller'
import { Route } from '../decorator/Route'
import { validate, ValidationError, ValidatorOptions } from 'class-validator'
import { Like } from 'typeorm'
import { UrbanTermDefinition } from '../entity/UrbanTermDefinition'

@Controller('/Users')
export default class UrbanTermController {
  private readonly termRepo = AppDataSource.getRepository(UrbanTerm) // Student Repository
  private readonly defRepo = AppDataSource.getRepository(UrbanTermDefinition) // Student Repository

  // https://github.com/typestack/class-validator#passing-options
  private readonly validOptions: ValidatorOptions = {
    stopAtFirstError: true,
    skipMissingProperties: false,
    validationError: {
      target: false,
      value: false
    }
  }

  @Route('get', '/:id*?')
  async read (req: Request, res: Response, next: NextFunction): Promise<UrbanTerm | UrbanTerm[]> {
    if (req.params.id) return await this.termRepo.findOneBy({ id: req.params.id })
    else {
      const findOptions: any = { order: {} } // prepare order and where props
      const existingFields = this.termRepo.metadata.ownColumns.map((col) => col.propertyName)
      console.log(req.query)
      if (req.query.search) {
        findOptions.where = []
        for (const existingField of existingFields) {
          findOptions.where.push({ [existingField]: Like('%' + req.query.searchwherelike + '%') })
        }
      }
      const sortField: string = existingFields.includes(req.query.sortby) ? req.query.sortby : 'id'
      findOptions.order[sortField] = req.query.reverse ? 'DESC' : 'ASC'
      // findOptions looks like{ order {phone: 'ASC'} }
      return await this.termRepo.find(findOptions)
    }
  }

  @Route('delete', '/:id')
  async delete (req: Request, res: Response, next: NextFunction): Promise<UrbanTerm> {
    const termToRemove = await this.termRepo.findOneBy({ id: req.params.id })
    res.status = 204
    if (termToRemove) {
      const definitionsToRemove = await this.defRepo.findBy({ UrbanTermID: termToRemove.id })
      for (const def of definitionsToRemove) {
        await this.defRepo.remove(def)
      }
      return await this.termRepo.remove(termToRemove)
    } else next()
  }

  @Route('post')
  async save (req: Request, res: Response, next: NextFunction): Promise<any> {
    // Extra validation - ensure the id param matached the id submitted in the body
    const newTerm = Object.assign(new UrbanTerm(), req.body)
    const violations = await validate(newTerm, this.validOptions)
    if (violations.length) {
      res.statusCode = 422 // Unprocessable Entity
      return violations
    } else {
      res.statusCode = 201
      return await this.termRepo.save(newTerm)
    }
  }
}
