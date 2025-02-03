import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { UserDto } from '../../dtos/create-user.dto';
import * as pactum from 'pactum';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../../../roles/roles.guard';

describe('UsersController', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3003);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3003');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return users with pagination', async () => {
      await prisma.user.createMany({
        data: [
          { email: 'user1@test.com', hash: 'hash1', name: 'User 1' },
          { email: 'user2@test.com', hash: 'hash2', name: 'User 2' },
        ],
      });

      await pactum
        .spec()
        .get('/users')
        .withQueryParams({
          page: 1,
          pageSize: 2,
        })
        .expectStatus(200)
        .expectJsonLike({
          total: 2,
          totalPages: 1,
          currentPage: 1,
          data: [
            { email: 'user1@test.com', name: 'User 1' },
            { email: 'user2@test.com', name: 'User 2' },
          ],
        });
    });

    it('should return an user by id', async () => {
      const user = await prisma.user.create({
        data: { email: 'user3@test.com', hash: 'hash3', name: 'User 3' },
      });

      await pactum
        .spec()
        .get(`/users/id/${user.id}`)
        .withQueryParams({
          page: 1,
          pageSize: 2,
        })
        .expectStatus(200)
        .expectJsonLike({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            hash: user.hash,
          },
        });
    });

    it('should return an user by email', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'useremail@test.com',
          hash: 'hashemail',
          name: 'User Email',
        },
      });

      await pactum
        .spec()
        .get(`/users/email/${user.email}`)
        .withQueryParams({
          page: 1,
          pageSize: 2,
        })
        .expectStatus(200)
        .expectJsonLike({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            hash: user.hash,
          },
        });
    });
  });

  describe('POST /users', () => {
    const userDto: UserDto = {
      email: 'new@test.com',
      name: 'New User',
      password: 'newhash',
    };

    it('should create a new user', async () => {
      await pactum.spec().post('/users').withJson(userDto).expectStatus(201);
    });

    it('should fail for unvalid user', async () => {
      await pactum
        .spec()
        .post('/users')
        .withJson({
          ...userDto,
          email: 'invalid-email',
        })
        .expectStatus(400);
    });
  });

  describe('PATCH /users', () => {
    it('should update an user by id', async () => {
      const user = await prisma.user.create({
        data: { email: 'user4@test.com', hash: 'hash4', name: 'User 4' },
      });

      await pactum
        .spec()
        .patch(`/users/${user.id}`)
        .withBody({
          email: 'modificado@email.com',
        })
        .expectStatus(204);

      await pactum
        .spec()
        .get(`/users/id/${user.id}`)
        .expectStatus(200)
        .expectBody({
          data: {
            email: 'modificado@email.com',
            hash: user.hash,
            id: user.id,
            name: user.name,
          },
        });
    });

    it('should not update an user with invalid info', async () => {
      const user = await prisma.user.create({
        data: { email: 'user5@test.com', hash: 'hash5', name: 'User 5' },
      });

      await pactum
        .spec()
        .patch(`/users/${user.id}`)
        .withBody({
          notvalid: 'modificado@email.com',
        })
        .expectStatus(204);

      await pactum
        .spec()
        .get(`/users/id/${user.id}`)
        .expectStatus(200)
        .expectBody({
          data: {
            email: user.email,
            hash: user.hash,
            id: user.id,
            name: user.name,
          },
        });
    });
  });

  describe('DELETE /users', () => {
    it('should delete an user by id', async () => {
      const user = await prisma.user.create({
        data: { email: 'user6@test.com', hash: 'hash6', name: 'User 6' },
      });

      await pactum
        .spec()
        .delete(`/users/${user.id}`)
        .withQueryParams({
          page: 1,
          pageSize: 2,
        })
        .expectStatus(204);
    });
  });
});
