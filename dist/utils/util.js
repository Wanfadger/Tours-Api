"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectPrismaFields = void 0;
const selectPrismaFields = (...fields) => {
    const obj = {};
    fields.forEach(element => {
        obj[element] = true;
    });
    return obj;
};
exports.selectPrismaFields = selectPrismaFields;
//# sourceMappingURL=util.js.map