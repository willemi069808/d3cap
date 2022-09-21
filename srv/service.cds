using db  from '../db/schema';

service ChartingService {
    entity Simulations         as projection on db.Simulations;
}