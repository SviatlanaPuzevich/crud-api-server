import request from "supertest";
import {createApp} from "../../src/app/app";
import { NewUser, User } from "../../src/types";

const app = createApp();

describe('users API tests', () => {
    let createdUser: User;

    beforeEach(async () => {
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
        createdUser = res.body;
    });

    afterEach(async () => {
        if (createdUser?.id) {
            await request(app).delete(`/api/users/${createdUser.id}`);
        }
    });

    it('GET /users/{id} → get existing user by id', async () => {
        const res = await request(app).get(`/api/users/${createdUser.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            id: createdUser.id,
            name: createdUser.name,
            age: createdUser.age,
        });
    });

    it('GET /users/{id} → returns 404 for deleted user', async () => {
        await request(app).delete(`/api/users/${createdUser.id}`);

        const res = await request(app).get(`/api/users/${createdUser.id}`);

        expect(res.statusCode).toBe(404);
    });
});
