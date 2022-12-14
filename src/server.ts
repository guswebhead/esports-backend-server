import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { convertMinutesStringTHours } from './utils/convert-minutes-to-hour-string'
import { convertHoursStringToMinutes } from './utils/convert-hour-string-to-minute'


const app = express()

app.use(express.json())
app.use(cors())

const prisma =  new PrismaClient({
   log: ['query']
})


app.get('/games', async (request, reponse) => {
   const games = await prisma.game.findMany({
      include: {
         _count: {
            select:{
               ads: true
            }
         }
      }
   })
   return reponse.json(games)
})

app.post('/games/:id/ads', async(request, reponse) => {
   const gameId = request.params.id;
   const body:any =  request.body

   const ad = await prisma.ad.create({
      data: {
         gameId,
         name: body.name,
         yearsPlaying: body.yearsPlaying,
         discord: body.discord,
         weekDays: body.weekDays.join(','),
         hourStart: convertHoursStringToMinutes(body.hourStart),
         hourEnd: convertHoursStringToMinutes(body.hourEnd),
         useVoiceChannel: body.useVoiceChannel
      }
   })

   return reponse.status(201).json(ad)
})

app.get('/games/:id/ads', async (request, response) =>{
   const gameId = request.params.id;
   const ads:any = await prisma.ad.findMany({
      select:{
         id: true,
         name: true,
         weekDays: true,
         useVoiceChannel: true,
         yearsPlaying: true,
         hourStart: true,
         hourEnd: true,
      },
      where: {
         gameId
      },
      orderBy:{
         createdAt: 'desc'
      }
   })
   return response.json(ads.map((ad:any)=> {
      return {
         ...ad,
         weekDays: ad.weekDays.split(','),
         hourStart: convertMinutesStringTHours(ad.hourStart),
         hourEnd: convertMinutesStringTHours(ad.hourEnd)
      }
   }))
})

app.get('/ads/:id/discord', async (request, response) =>{
   const adId = request.params.id;
   const ad = await prisma.ad.findUniqueOrThrow({
      select: {
         discord: true
      },
      where: {
         id: adId
      }
   })
   return response.json({
      discord: ad.discord
   })
})


app.listen(3333)


// tipos de parametros
// QUERY: ... (sempre s??o nomeados, s??o usados geralmente para filtros) ex: page=2
// ROUTE: ...  (uma identifca????o de um recuros) ex: localhost:3333/ads/5
// BODY: ... (varias informa????es numa unica requisi????o)


//  HTTP methods / API RESTful / HTTP Codes
//  GET , POST , PUT , PATCH , DELETE