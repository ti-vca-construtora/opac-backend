import { Test, TestingModule } from '@nestjs/testing';
import { EmpreendimentosController } from '../empreendimentos.controller';

describe('EmpreendimentosController', () => {
  let controller: EmpreendimentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpreendimentosController],
    }).compile();

    controller = module.get<EmpreendimentosController>(
      EmpreendimentosController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
