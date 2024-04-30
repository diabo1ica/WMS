# How to run:
For these instructions we will assume: 
* you are using a RHEL 9 virtual machine
* you have downloaded the zip file and also extracted it

## Steps
### Backend
  `sudo -i`

  `dnf install python3.11`

Type y for all the prompts

  `cd <repo>/project-backend`

  `pip3.11 install -r requirements.txt`

  `cd WMS`

  `python3.11 manage.py makemigrations`

  `python3.11 manage.py migrate`

  `python3.11 manage.py runserver`

### Frontend:
#### NodeJS Installation
  `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`

  `nvm install 20`
  
  `cd <git-repo>/client`

  `npm install`

  `npm run dev`

Go to localhost:5783 in your browser to access the website.
