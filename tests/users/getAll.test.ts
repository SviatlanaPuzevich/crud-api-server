import request from 'supertest';
import {app} from '../../src/app/app';

describe('users API tests', () => {
    it('GET /users → returns empty list of users', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });
});