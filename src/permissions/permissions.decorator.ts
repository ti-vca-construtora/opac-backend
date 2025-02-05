import { SetMetadata } from '@nestjs/common';

export const Permission = (permissions: { [area: string]: string[] } | '') =>
  SetMetadata('permissions', permissions);
