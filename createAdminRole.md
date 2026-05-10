#to create admin role
go to: 
    ./backend
      --app
        --routers
            --auth.py 
                change role in /register
                    --line no: 20
                        role="admin"

you can create one admin role 
and change it back to "reviewer" to make
users with reviewer role.