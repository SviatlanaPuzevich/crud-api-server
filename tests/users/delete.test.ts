import request from "supertest";
import {createApp} from "../../src/app/app";
import {NewUser} from "../../src/types";

const app = createApp();

describe('users API tests', () => {
    it('DELETE /users/{id} → successfully deletion of a existing user', async () => {
        const newUser: NewUser = {
            name: "Hermione Granger",
            age: 15,
            hobbies: ["learning"],
        };

        const postResponse = await request(app)
            .post('/api/users')
            .send(newUser)
            .set('Accept', 'application/json');
        const id = postResponse.body.id;

        const response = await request(app)
            .delete(`/api/users/${id}`);

        expect(response.statusCode).toBe(204);

        const res = await request(app).get('/api/users');

        expect(res.body).toEqual([]);
    });
});
