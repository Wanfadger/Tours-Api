import express, { Router } from 'express';
import * as TourController from '../controllers/TourController'

export const TourRouter:Router = express.Router();

TourRouter.route("/").get(TourController.getTours).post(TourController.createTour)

TourRouter.route("/load").post(TourController.loadTours)

TourRouter.route("/:id").get(TourController.getTour).put(TourController.updateTour).delete(TourController.deleteTour);






