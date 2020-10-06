const Repository = require('../models/Repository');

module.exports = 
class ContactsController extends require('./Controller') {
    constructor(req, res){
        super(req, res);
        this.contactsRepository = new Repository('Contacts');
    }
    // GET: api/contacts
    // GET: api/contacts/{id}
    get(id){
        if(!isNaN(id))
            this.response.JSON(this.contactsRepository.get(id));
        else
            this.response.JSON(this.contactsRepository.getAll());
    }
    invalidPhone(phone) {
        let r = /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/;
        return !r.test(phone);
    }
    contactAlreadyExists(name) {
        let contacts = this.contactsRepository.getAll();
        for(let i = 0; i < contacts.length; i++) {
            if(contacts[i].Name === name)
                return true;
        }
        return false;
    }
    contactAlreadyExistsPut(contact) {
        let contacts = this.contactsRepository.getAll();
        for(let i = 0; i < contacts.length; i++) {
            if(contact.Id !== contacts[i].Id)
                if(contacts[i].Name === contact.Name)
                    return true;
        }
        return false;
    }
    // POST: api/contacts body payload[{"Id": 0, "Name": "...", "Email": "...", "Phone": "..."}]
    post(contact){  
        if((contact.Name === "" || contact.Name === undefined) || 
            (contact.Email === "" || contact.Email === undefined) || 
                (this.invalidPhone(contact.Phone)) || contact.Phone === undefined) {
                    this.response.badRequest();
        }
        else if(this.contactAlreadyExists(contact.Name)) {
            this.response.conflict();
        }
        else {
            this.response.created(JSON.stringify(this.contactsRepository.add(contact)));
        }
    }
    // PUT: api/contacts body payload[{"Id":..., "Name": "...", "Email": "...", "Phone": "..."}]
    put(contact){
        if((contact.Name === "" || contact.Name === undefined) || 
            (contact.Email === "" || contact.Email === undefined) || 
                (this.invalidPhone(contact.Phone)) || contact.Phone === undefined) {
                    this.response.badRequest();
        }
        else if(this.contactAlreadyExists(contact.Name)) {
            this.response.conflict();
        }
        else {
            if (this.contactsRepository.update(contact))
                this.response.ok();
            else 
                this.response.notFound();
        }
    }
    // DELETE: api/contacts/{id}
    remove(id){
        if (this.contactsRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
}