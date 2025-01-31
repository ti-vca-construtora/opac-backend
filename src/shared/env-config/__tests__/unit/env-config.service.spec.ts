import { Test, TestingModule } from '@nestjs/testing';
import { EnvConfigService } from '../../env-config.service';
import { EnvConfigModule } from '../../env-config.module';

describe('EnvConfigService unit tests', () => {
  let sut: EnvConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnvConfigService],
      imports: [EnvConfigModule.forRoot()],
    }).compile();

    sut = module.get<EnvConfigService>(EnvConfigService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should return the variable PORT', () => {
    expect(sut.getPort()).toBe(3003);
  });

  it('should return the variable NODE_ENV', () => {
    expect(sut.getNodeEnv()).toBe('test');
  });

  it('should return the variable DATABASE_URL', () => {
    expect(sut.getDatabaseUrl()).toBe(
      'postgresql://test:testpw@localhost:5435/vca-tech-test?schema=public',
    );
  });
});
