import {Injectable,} from "@angular/core";

@Injectable()
export abstract class LoggingService {
  abstract captureError(error: any) ;
}
