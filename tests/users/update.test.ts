import request from "supertest";
import { app } from "../../src/app/app";
import {NewUser, User} from "../../src/types";

describe('users API tests', () => {
    it('PUT /users/{id} → get updated user', async () => {
        const newUser: NewUser = {
            name: "Hermione Granger",
            age: 15,
            hobbies: ["learning"],
        };

        const postResponse = await request(app)
            .post('/api/users')
            .send(newUser)
            .set('Accept', 'application/json');
        const createdUser: User = postResponse.body;
        createdUser.age = 16;
        createdUser.hobbies = ["learning", "magic"];

        const response = await request(app)
            .put(`/api/users/${createdUser.id}`)
            .send(createdUser)
            .set('Accept', 'application/json');

        expect(response.statusCode).toBe(200);
        expect(response.body.age).toBe(16);
        expect(response.body.hobbies).toContain("magic");
    });
});
