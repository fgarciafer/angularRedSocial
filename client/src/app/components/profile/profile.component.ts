import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { GLOBAL } from '../../services/global';
import { FollowService } from '../../services/follow.service';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    providers: [UserService,FollowService]
  })

  export class ProfileComponent implements OnInit{
        public title: string;
        public user: User;
        public status: string;
        public identity;
        public token;
        public url: string;
        public stats;
        public followed;
        public following;

        constructor(
            private _userService:UserService,
            private _route:ActivatedRoute,
            private _router:Router,
            private _followService: FollowService
        ){
            this.url = GLOBAL.url;
            this.token = this._userService.getToken();
            this.identity = this._userService.getIdentity();
            this.title = 'Perfil';       
            this.followed = false;
            this.following = false;
        }

        ngOnInit(){
            console.log('Componente profile cargado correctamente');
            this.loadPage();
        }

        loadPage(){
            this._route.params.subscribe(params => {
                let id = params['id'];
                this.getUser(id);
                this.getCounters(id);
            });
        }

        getUser(id){
            this._userService.getUser(id).subscribe(
                response => {
                    if(response.user){
                        this.user = response.user;
                        
                        if(response.following && response.following._id){
                            this.following = true;
                        }else{
                            this.following = false;
                        }

                        if(response.followed && response.followed._id){
                            this.followed = true;
                        }else{
                            this.followed = false;
                        }             
                    }else{
                        this.status = 'error';
                    }
                },
                error => {
                    this._router.navigate(['/perfil',this.identity._id]);
                    console.log(<any>error);
                }
            );
        }

        getCounters(id){
            this._userService.getCounters(id).subscribe(
                response => {
                    this.stats = response;
                },
                error => {
                    console.log(<any>error);
                }   
            );
        }

        followUser(followed){
            let follow = new Follow('', this.identity, followed);

            this._followService.addFollow(this.token, follow).subscribe(
                response => {
                    this.following = true;
                },
                error => {
                    console.log(<any>error);
                }
            );
        }

        unFollowUser(followed){
            this._followService.deleteFollow(this.token, followed).subscribe(
                response =>{
                    this.following = false;
                },
                error => {
                    console.log(<any>error);
                }
            );
        }

        public followUserOver;
        mouserEnter(user_id){
            this.followUserOver = user_id;
        }

        mouseLeave(user_id){
            this.followUserOver = 0;
        }
        
  }