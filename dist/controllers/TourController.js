"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTours = exports.deleteTour = exports.updateTour = exports.getTour = exports.getTours = exports.createTour = void 0;
const client_1 = require("@prisma/client");
const exceptions_util_1 = require("../utils/exceptions.util");
const prisma = new client_1.PrismaClient();
const createTour = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = req.body;
    try {
        const savedTour = yield prisma.tour.create({ data: {
                name: tour.name,
                price: tour.price,
                rating: tour.rating,
                priceDiscount: tour.priceDiscount,
                summary: tour.summary,
                duration: tour.duration,
                description: tour.description,
                difficulty: tour.difficulty == "EASY" ? client_1.Difficulty.EASY : tour.difficulty == "MEDIUM" ? client_1.Difficulty.MEDIUM : client_1.Difficulty.DIFFICULT,
                imageCover: tour.imageCover,
                images: tour.images,
                maxGroupSize: tour.maxGroupSize,
                startDates: tour.startDates.map(d => new Date(d)),
                endDates: tour.endDates.map(d => new Date(d)),
            } });
        res.status(201).json({
            data: savedTour,
            message: "Successfully created tour",
        });
    }
    catch (error) {
        // console.error(error)
        if (error.code === 'P2002') {
            res.status(400).json({ error: new exceptions_util_1.UniqueViolationException(`Values for "${error.meta.target}" are creating duplicate values`).message,
                t: error
            });
        }
        else {
            next(error);
        }
    }
});
exports.createTour = createTour;
const getTours = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const queryObj = Object.assign({}, req.query);
    let excludeQuery = ['page', 'sort', 'limit', 'fields'];
    // excludeQuery.forEach(query => (delete queryObj[query]))
    console.log(queryObj);
    let sortQuery = null;
    if (queryObj && queryObj.sort) {
        console.log(queryObj.sort);
        if (typeof queryObj.sort === 'string') {
            const sortKeys = (queryObj.sort).split(',');
            sortQuery = sortKeys.map((k) => {
                const query = { [k]: 'asc' };
                return query;
            });
            console.log(sortKeys);
        }
        else {
            const sortDirection = Object.keys(queryObj.sort).length > 0 ? Object.keys(queryObj.sort)[0] : 'asc';
            console.log(sortDirection);
            const keyString = queryObj.sort[sortDirection];
            const sortKeys = keyString.split(',');
            sortQuery = sortKeys.map((k) => {
                const query = { [k]: sortDirection };
                return query;
            });
        }
    }
    let durationQuery = queryObj.duration;
    console.log(durationQuery);
    console.log(sortQuery);
    try {
        let tours = [];
        /// sort and duration
        if (queryObj && (queryObj.sortDirection || queryObj.duration)) {
            tours = yield prisma.tour.findMany({
                orderBy: [...sortQuery],
                where: { duration: queryObj.duration }
            });
            res.status(200).json({
                message: "success",
                count: tours.length,
                data: tours
            });
        }
        else if (queryObj && queryObj.duration) {
            tours = yield yield prisma.tour.findMany({
                where: { duration: Object.assign({}, queryObj.duration) }
            });
            res.status(200).json({
                message: "success",
                count: tours.length,
                data: tours
            });
        }
        else if (queryObj && queryObj.sort) {
            tours = yield yield prisma.tour.findMany({
                orderBy: [...sortQuery],
            });
            res.status(200).json({
                message: "success",
                count: tours.length,
                data: tours
            });
        }
        else {
            tours = yield yield prisma.tour.findMany();
            res.status(200).json({
                message: "success",
                count: tours.length,
                data: tours
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getTours = getTours;
const getTourById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.tour.findUnique({
        where: { id: id }
    });
});
const getTour = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const tour = yield getTourById(id);
        if (!tour) {
            res.status(404).json({ message: `No tour found matching ${id}` });
        }
        res.status(200).json({ data: tour });
    }
    catch (error) {
        next(error);
    }
});
exports.getTour = getTour;
const updateTour = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const tour = req.body;
    try {
        if (!(yield getTourById(id))) {
            res.status(404).json({ message: `No tour found matching ${id}` });
        }
        const updatedTour = yield prisma.tour.update({
            where: { id: id },
            data: { name: tour.name, rating: tour.rating, price: tour.price }
        });
        res.status(200).json({ data: updatedTour });
    }
    catch (error) {
        next(error);
    }
});
exports.updateTour = updateTour;
const deleteTour = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        if (!(yield getTourById(id))) {
            res.status(404).json({ message: `No tour found matching ${id}` });
        }
        yield prisma.tour.delete({ where: { id } });
        res.status(204).json({ message: `successfully deleted tour` });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteTour = deleteTour;
const loadTours = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dd = exceptions_util_1.data;
        yield prisma.tour.createMany({
            data: [...dd.map(tour => ({
                    name: tour.name,
                    price: tour.price,
                    rating: tour.rating,
                    priceDiscount: tour.priceDiscount,
                    summary: tour.summary,
                    duration: tour.duration,
                    description: tour.description,
                    difficulty: tour.difficulty == "EASY" ? client_1.Difficulty.EASY : tour.difficulty == "MEDIUM" ? client_1.Difficulty.MEDIUM : client_1.Difficulty.DIFFICULT,
                    imageCover: tour.imageCover,
                    images: tour.images,
                    maxGroupSize: tour.maxGroupSize,
                    startDates: tour.startDates.map(d => new Date(d)),
                    endDates: tour.endDates.map(d => new Date(d)),
                }))]
        });
        res.json({
            message: `Successfully created tours ${dd.length}`
        });
    }
    catch (error) {
        // console.error(error)
        if (error.code === 'P2002') {
            res.status(400).json({ error: new exceptions_util_1.UniqueViolationException(`Values for "${error.meta.target}" are creating duplicate values`).message,
                t: error
            });
        }
        else {
            next(error);
        }
    }
});
exports.loadTours = loadTours;
//# sourceMappingURL=TourController.js.map