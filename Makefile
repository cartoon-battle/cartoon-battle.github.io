all:
	docker run --rm -v $(shell pwd):/srv/jekyll --net szg_default -it -p 4000 \
	    --label 'traefik.http.routers.cartoon-battle.rule=Host("www.cartoon-battle.dev")' \
	    jekyll/jekyll jekyll serve --watch 
