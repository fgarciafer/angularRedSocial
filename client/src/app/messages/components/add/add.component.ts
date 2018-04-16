import { Component, OnInit, DoCheck } from '@angular/core';
import { Message } from '../../../models/message';
import { MessageService } from '../../../services/message.service';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { GLOBAL } from '../../../services/global';
import { Follow } from '../../../models/follow';
import { FollowService } from '../../../services/follow.service';
import { Route } from '@angular/compiler/src/core';
import { UserService } from '../../../services/user.service';

@Component({
    selector: 'add',
    templateUrl: './add.component.html',
    providers: [
        MessageService,
        FollowService,
        UserService
    ]
  })

  export class AddComponent implements OnInit{
    public title: string;
    public message: Message;
    public identity;
    public token;
    public url;
    public status;
    public follows;

    constructor(
          private _router:Router,
          private _route:ActivatedRoute,
          private _followService:FollowService,
          private _messageService:MessageService,
          private _userService:UserService
      ){
          this.title = 'Enviar mensaje';
          this.identity = this._userService.getIdentity();
          this.token = this._userService.getToken();
          this.url = GLOBAL.url;
          this.message = new Message('','','','', this.identity.id,'');          
      }

      ngOnInit(){
          console.log('El componente add se ha cargado');
          this.getMyFollows();
      }

      onSubmit(form){
          this._messageService.addMessage(this.token, this.message).subscribe(
              response => {
                if(response.message){
                    this.status = 'success';
                    form.reset();
                }else{
                    this.status = 'error';
                }                
              },
              error => {
                this.status = 'error';
                console.log(<any>error);
              }
          );
      }

      getMyFollows(){
          this._followService.getMyFollows(this.token).subscribe(
              response => {
                this.follows = response.follows;
              },
              error => {
                console.log(<any>error);
              }
          );
      }
  }