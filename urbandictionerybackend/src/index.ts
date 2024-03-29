import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Request, Response, NextFunction } from 'express'
import { AppDataSource } from './data-source'
import * as createError from 'http-errors'
import { RouteDefinition } from './decorator/RouteDefinition'
import DictionaryUserController from './controller/DictionaryUserController'
import UrbanTermController from './controller/UrbanTermController'
import UrbanTermDefinitionController from './controller/UrbanTermDefinitionController'
import { DictionaryUser } from './entity/DictionaryUser'
import { UrbanTerm } from './entity/UrbanTerm'
import { UrbanTermDefinition } from './entity/UrbanTermDefinition'
import * as cors from 'cors'

const corsOptions = {
  origin: /localhost:\d{4,5}$/i, // localhost any 4 digit port
  credentials: true, // needed to set and return cookies
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  methods: 'GET,PUT,POST,DELETE',
  maxAge: 43200 // 12 hours,
}

AppDataSource.initialize().then(async () => {
  // create express app
  const app = express()
  app.use(bodyParser.json())

  app.use(cors(corsOptions))

  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.headers.authorization) {
      console.log(req.headers.authorization)
      if (req.headers.authorization.match(/^Bearer.UrbanDictionary$/s)) next()
      else next(createError(406))
    } else next(createError(406))
  })

  // register express routes from defined application routes
  const controllers: any[] = [DictionaryUserController, UrbanTermController, UrbanTermDefinitionController]
  // Iterate over all our controllers and register our routes
  controllers.forEach((controller) => {
    // This is our instantiated class
    // eslint-disable-next-line new-cap
    const instance = new controller()
    // The prefix saved to our controller
    const path = Reflect.getMetadata('path', controller)
    // Our `routes` array containing all our routes for this controller
    const routes: RouteDefinition[] = Reflect.getMetadata('routes', controller)

    // Iterate over all routes and register them to our express application
    routes.forEach((route) => {
      // eslint-disable-next-line max-len,
      app[route.method.toLowerCase()](path + route.param, (req: Request, res: Response, next: NextFunction) => {
        const result = instance[route.action](req, res, next)
        if (result instanceof Promise) {
          result.then((result) => result !== null && result !== undefined ? res.send(result) : next())
            .catch((err) => next(createError(500, err)))
        } else if (result !== null && result !== undefined) res.json(result)
      })
    })
  })

  // setup express app here
  // ...

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404))
  })

  // error handler
  app.use(function (err, req, response, next) {
    response.status = err.status || 500
    response.json({ status: err.status, message: err.message, stack: err.stack.split(/\s{4,}/) })
  })

  // start express server
  app.listen(3008)

  // insert new users for test
  // await AppDataSource.manager.save(
  //   AppDataSource.manager.create(DictionaryUser, {
  //     DisplayName: 'HaxSaw',
  //     UserName: 'HackSaws',
  //     Password: 'HackSams83'
  //   })
  // )
  //
  // await AppDataSource.manager.save(
  //   AppDataSource.manager.create(UrbanTerm, {
  //     UrbanTerm: 'Phantom'
  //   })
  // )
  //
  // await AppDataSource.manager.save(
  //   AppDataSource.manager.create(UrbanTermDefinition, {
  //     user: await AppDataSource.manager.findOneBy(DictionaryUser, { id: 1 }),
  //     urbanterm: await AppDataSource.manager.findOneBy(UrbanTerm, { id: 1 }),
  //     definition: 'Another word for ghost'
  //   })
  // )

  console.log('Express server has started on port 3008. Open http://localhost:3008/ to see results')
}).catch(error => console.log(error))
