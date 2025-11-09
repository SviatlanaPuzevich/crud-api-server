import request from "supertest";
import { createApp } from "../../src/app/app";
import { NewUser } from "../../src/types";

const app = createApp();

describe('users API tests', () => {
    it('POST /users → creates and returns new user', async () => {
        const newUser: NewUser = {
            name: "Hermione Granger",
            age: 15,
            hobbies: ["learning"],
        };

        const res = await request(app)
            .post('/api/users')
            .send(newUser)
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe(newUser.name);
        expect(res.body.hobbies).toContain('learning');
    });
});
