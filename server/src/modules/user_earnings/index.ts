import Elysia from 'elysia';
import { AuthGuard } from '../auth/guard';
import { UserRole } from '../../enums/Role.enum';
import { EarningModel } from './model';
import { EarningService } from './service';

export const userEarningController = new Elysia({ prefix: '/auth' })
    .use(AuthGuard)

    .get('/:provider_id', async ({ params }) => EarningService.getStats(params), {
        response: {
            200: EarningModel.getUserEarnings,
            404: EarningModel.notFound,
        },
        isAuthenticated: true,
    })

