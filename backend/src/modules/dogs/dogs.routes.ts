import { Router } from 'express';
import { createDog, deleteDog, getDog, listDogs, listMyDogs, updateDog } from './dogs.controller';

export const dogRoutes = Router();

dogRoutes.get('/list', listDogs);
dogRoutes.get('/my', ...listMyDogs);
dogRoutes.get('/detail/:id', getDog);
dogRoutes.get('/', listDogs);
dogRoutes.get('/:id', getDog);
dogRoutes.post('/create', ...createDog);
dogRoutes.post('/', ...createDog);
dogRoutes.put('/update/:id', ...updateDog);
dogRoutes.put('/:id', ...updateDog);
dogRoutes.delete('/delete/:id', ...deleteDog);
dogRoutes.delete('/:id', ...deleteDog);
