import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsApiService } from './data-access/projects.api.service';
import { ProjectsStateService } from './data-access/projects.state.service';
import { ListShellComponent } from 'src/app/shared/ui/list-shell.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MessageDialogComponent, MessageDialogFormValue } from 'src/app/shared/ui/common-message-dialog.component';
import { tap, take } from 'rxjs';
import { MessagesApiService } from '../messages/data-access/messages.api.service';
import { MatSnackBar, MatSnackBarRef, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-projects.page',
  standalone: true,
  imports: [
    CommonModule,
    ListShellComponent,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <ng-container *ngIf="state() as state">
      <app-list-shell *ngIf="state.loadListCallState === 'LOADED'" listName="Projekty" [list]="state.list">
        <div #filters>
          <div class="ml-auto">
            <label> Sortuj:</label>
            <select>
              <option>od najnowszych</option>
              <option>od najstarszych</option>
            </select>
          </div>
        </div>
        <ng-template #item let-project>
          <div class="">
            <div>
              <mat-icon class="text-red-600 ml-auto">favorite</mat-icon>
            </div>
            <div class="relative">
              <div class="absolute bg-black text-white right-0 text-sm px-1 py-2">12/06/2023 17:00</div>
              <img [src]="project.imageLink" />
            </div>
            <div class="rounded-md w-fit px-2 mt-4 mb-2 bg-green-400 text-green-900">
              {{ project.status?.name }}
            </div>
            <p class="font-semibold text-lg">{{ project.name }}</p>
            <div class="mb-2">
              <span *ngFor="let tag of project.tags; let last = last">#{{ tag }} </span>
            </div>
            <mat-divider />
            <div class="flex justify-between mt-4 items-center">
              <div class="flex flex-col items-center">
                <span class="text-xs"> Budżet</span><mat-icon>paid</mat-icon>
                <span class="text-xs">{{ project.budget }}</span>
              </div>
              <div *ngIf="project.possibleVolunteer" class="flex flex-col items-center">
                <span class="text-xs"> Szukamy</span>

                <mat-icon>accessibility new</mat-icon>
                <span class="text-xs">wolontariuszy</span>
              </div>
              <div *ngIf="project.cooperationMessage" class="flex flex-col">
                <mat-icon [matTooltip]="project.cooperationMessage">spatial_audio_off</mat-icon>
              </div>
              <div class="flex flex-col" (click)="openMessageModal(project.id, project.name)">
                <mat-icon>forward_to_inbox</mat-icon>
              </div>
            </div>
          </div>
        </ng-template>
      </app-list-shell>
      <p *ngIf="state.loadListCallState === 'LOADING'">LOADING...</p>
    </ng-container>

    <!-- <img
      src="https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" /> -->
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectsListPageComponent implements OnInit {
  snackbar = inject(MatSnackBar);
  service = inject(ProjectsApiService);
  messagesService = inject(MessagesApiService);
  state = inject(ProjectsStateService).$value;
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.service.getAll();
  }

  openMessageModal(id: string, name: string) {
    this.dialog
      .open(MessageDialogComponent, {
        width: '500px',
        data: {
          name,
          connector: 'odnośnie projektu',
        },
      })
      .afterClosed()
      .pipe(
        tap((value: MessageDialogFormValue) => {
          if (value) {
            this.snackbar.open('Wiadomość została wysłana!', '', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            });
            this.messagesService.send({ ...value, receiverId: id, receiverType: 'ngo' });
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
