SHELL=/bin/bash

all:
	python kango/kango.py build ./
	
upload:
	cd output && scp update_* vkcustomstickers_* forum:kuzya.org/static_html/extensions