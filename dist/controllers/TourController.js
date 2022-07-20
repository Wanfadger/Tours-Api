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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTours = exports.deleteTour = exports.updateTour = exports.getTour = exports.getTours = exports.createTour = void 0;
const ApiError_1 = require("./../utils/ApiError");
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const data_1 = require("./../utils/data");
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
            next(new ApiError_1.ApiError(`Values for "${error.meta.target}" are creating duplicate values`, 400));
        }
        else {
            next(new ApiError_1.ApiError(`Values for "${error.meta.target}" are creating duplicate values`));
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
    ////////////////// SORT
    if (queryObj && queryObj.sort) {
        if (typeof queryObj.sort === 'string') {
            console.log("QUERY IS STRING");
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
    ////////////////// FIELDS ////////////////////////////////
    let fieldQuery = null;
    if (queryObj && queryObj.fields) {
        const fieldNames = queryObj.fields.split(',');
        if (fieldNames.length > 0) {
            fieldQuery = {};
            fieldNames.forEach((fieldName) => {
                if (fieldQuery) {
                    fieldQuery[fieldName] = true;
                }
            });
        }
        else {
            fieldQuery = { [queryObj.fields]: true };
        }
    }
    //////////  DURATION //////////////////////////////////
    let durationQuery = queryObj.duration;
    //////////  PAGINATION //////////////////////////////////
    let skip = 0;
    let limit = 50;
    if (queryObj.page && queryObj.page) {
        const page = Number(queryObj.page);
        limit = Number(queryObj.limit) || 50;
        skip = ((page - 1) * limit) || 50;
    }
    console.log(durationQuery);
    console.log(sortQuery);
    console.log(fieldQuery);
    try {
        let tours = [];
        /// sort and duration
        if (queryObj && (queryObj.sort && queryObj.duration && queryObj.fields)) {
            tours = yield prisma.tour.findMany({
                orderBy: [...sortQuery],
                where: { duration: queryObj.duration },
                select: Object.assign({}, fieldQuery)
            });
            res.status(200).json({
                message: "success",
                count: tours.length,
                data: tours
            });
        }
        else if (queryObj && queryObj.duration) {
            tours = yield yield prisma.tour.findMany({
                where: { duration: Object.assign({}, queryObj.duration) },
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
        else if (queryObj && queryObj.fields) {
            tours = yield yield prisma.tour.findMany({
                select: Object.assign({}, fieldQuery)
            });
            res.status(200).json({
                message: "success",
                count: tours.length,
                data: tours
            });
        }
        else {
            tours = yield yield prisma.tour.findMany({
                take: limit
            });
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
            return next(new ApiError_1.ApiError(`No tour found matching ${id}`, 404));
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
        const dd = data_1.data;
        (0, util_1.promisify)(fs_1.default.readFile);
        fs_1.default.readFile("./dist/assets/tours.json", { encoding: "utf8" }, (err, data) => {
            console.log(data);
            console.log(err);
        });
        const tours = [];
        // console.log(tours)
        // console.log(tours)
        // await prisma.tour.createMany({
        //     data: [... dd.map(tour => ({
        //         name: tour.name,
        //         price: tour.price,
        //         rating: tour.rating,
        //         priceDiscount: tour.priceDiscount,
        //         summary: tour.summary,
        //         duration: tour.duration,
        //         description: tour.description,
        //         difficulty: tour.difficulty == "EASY" ? Difficulty.EASY : tour.difficulty == "MEDIUM" ? Difficulty.MEDIUM : Difficulty.DIFFICULT,
        //         imageCover: tour.imageCover,
        //         images: tour.images,
        //         maxGroupSize: tour.maxGroupSize,
        //         startDates: tour.startDates.map(d => new Date(d)),
        //         endDates: tour.endDates.map(d => new Date(d)),
        //     }))]
        // })
        res.json({
            message: `Successfully created tours ${dd.length}`,
            data: tours
        });
    }
    catch (error) {
        // console.error(error)
        return next(error);
    }
});
exports.loadTours = loadTours;
//# sourceMappingURL=TourController.js.map