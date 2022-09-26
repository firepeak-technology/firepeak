import {Injectable,} from "@angular/core";

@Injectable()
export abstract class SnackbarService {
  abstract error(message: string): void

  abstract success(message: string): void
}
