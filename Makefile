deploy:
	rsync -avhzL --delete \
		--no-perms --no-owner --no-group \
		--exclude .git \
		--filter=":- .gitignore" \
		-e "ssh -i ~/Downloads/johnny_vu.pem" \
		. ubuntu@54.144.173.103:~/api.pulsecoinlist.com