import * as express from "express";
import { IUser } from "../../api/user/interfaces";

export const success = (res: express.Response, status?: number) => (entity?: any) => {
    if (entity) {
        res.status(status || 200).json(entity);
    }
};

export const notFound = (res: express.Response) => (entity?: any) => {
    if (entity) {
        return entity;
    }
    res.status(404).end();
};

export const authorOrAdmin = (res: express.Response, user: IUser, userField: string) => (entity?: any) => {
    if (entity) {
        const isAdmin = user.role === "admin";
        const isAuthor = entity[userField] && entity[userField].equals(user.id);
        if (isAuthor || isAdmin) {
            return entity;
        }
        res.status(401).end();
    }
};
