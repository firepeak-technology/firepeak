import {Injectable,} from "@angular/core";

@Injectable()
export abstract class SnackbarService{
  abstract error(message: string)
  abstract success(message: string)
}
