import { Test, TestingModule } from '@nestjs/testing';
import { EmpreendimentosService } from '../empreendimentos.service';

describe('EmpreendimentosService', () => {
  let service: EmpreendimentosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmpreendimentosService],
    }).compile();

    service = module.get<EmpreendimentosService>(EmpreendimentosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
