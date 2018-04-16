import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { GLOBAL } from '../../services/global';
import { Publication } from '../../models/publication';
import { PublicationService } from '../../services/publication.service';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  providers: [UserService,PublicationService,UploadService]
})

export class SidebarComponent implements OnInit{
    public identity;
    public token;
    public status;
    public url;
    public stats;
    public publication: Publication;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService:UserService,
        private _publicationService:PublicationService,
        private _uploadService:UploadService
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

    onSubmit(form, $event){
        this._publicationService.addPublication(this.token, this.publication).subscribe(
            response =>{
                if(!response.publication){
                    this.status = 'error';
                }else{
                    form.reset();
                    this.status = 'success';

                    if(this.filesToUpload && this.filesToUpload.length){
                        // Subir imagen
                        this._uploadService.makeFileRequest(this.url+'upload-image-pub/'+response.publication._id,[],this.filesToUpload, this.token,'image')
                            .then((result:any)=>{
                                this.publication.file = result.image;
                                this._router.navigate(['/timeline']);
                                this.sended.emit({send:'true'});
                            });
                    } else{
                        this._router.navigate(['/timeline']);
                        this.sended.emit({send:'true'});
                    }
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

    public filesToUpload: Array<File>;
    fileChangeEvent(fileInput: any){
        this.filesToUpload = <Array<File>>fileInput.target.files;
    }


    //OUTPUT
    @Output() sended = new EventEmitter();

    sendPublication(event){
        this.sended.emit({send:'true'});
    }

}