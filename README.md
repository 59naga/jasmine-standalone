# Jasmine-standalone [![Bower version][bower-image]][bower]

> Jasmine-browser full-stack file.

## Installation
```Bash
$ bower install jasmine-standalone
```

index.html:

```html
<script src="bower_components/jasmine-standalone/jasmine-standalone.js"></script>
<script>
  describe('XMLHttpRequest',function(){
    describe('http://static.edgy.black',function(){
      it('<title> is static.edgy.black',function(done){
        xhr= new XMLHttpRequest;
        xhr.open('GET','http://static.edgy.black',true);
        xhr.responseType= 'text/html';
        xhr.send();
        xhr.onload= function(){
          var parsed= $.parseHTML(xhr.response);
          var html= $('<div />').append(parsed);
          var textContent= html.find('h1').text();
          
          expect(textContent).toBe('static.edgy.black');
          done();
        }
      });
    });
  });
</script>
```

Becomes:

![2015-05-10 13 15 59](https://cloud.githubusercontent.com/assets/1548478/7553053/c5c8c3fa-f716-11e4-9eb6-00c0cd23aa6d.png)

## API

> http://jasmine.github.io/2.3/introduction.html

## Build
```bash
$ npm install
$ npm run build
```

License
===
[MIT][License]

[License]: http://59naga.mit-license.org/

[bower-image]: https://badge.fury.io/bo/jasmine-standalone.svg
[bower]: http://badge.fury.io/bo/jasmine-standalone