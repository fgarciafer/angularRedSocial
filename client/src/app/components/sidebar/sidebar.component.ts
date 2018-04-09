import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { GLOBAL } from '../../services/global';
import { Publication } from '../../models/publication';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  providers: [UserService]
})

export class SidebarComponent implements OnInit{
    public identity;
    public token;
    public status;
    public url;
    public stats;
    public publication: Publication;

    constructor(
        private _userService:UserService
    ){
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.stats = this._userService.getStats();
        this.url = GLOBAL.url;
        this.publication = new Publication('','','','',this.identity._id);
    }

    ngOnInit(){
        console.log('El componente sidebar ha sido cargado');
    }

    onSubmit(){
        
    }


}