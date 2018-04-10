import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { GLOBAL } from '../../services/global';
import { Publication } from '../../models/publication';
import { PublicationService } from '../../services/publication.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  providers: [UserService,PublicationService]
})

export class SidebarComponent implements OnInit{
    public identity;
    public token;
    public status;
    public url;
    public stats;
    public publication: Publication;

    constructor(
        private _userService:UserService,
        private _publicationService:PublicationService
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

    onSubmit(form){
        this._publicationService.addPublication(this.token, this.publication).subscribe(
            response =>{
                if(!response.publication){
                    this.status = 'error';
                }else{
                    form.reset();
                    // this.publication = response.publication;
                    this.status = 'success';
                }
            },
            error =>{
                var errorMessage = <any> error;
                if(!errorMessage){
                    this.status = 'error';
                }
            }
        );
    }


}