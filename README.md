# Usage
```html
<script src="jasmine-standalone.js"></script>
<script>
  describe('Specs',function(){
    describe('first',function(){
      it('Begin bdd.',function(){
        expect("hello world!").toMatch('hell');
      });
      it('End of bdd.',function(){
        expect("world end!").not.toMatch('hell');
      });
    });
  });
</script>
```
![](https://qiita-image-store.s3.amazonaws.com/0/12153/114dc302-c38b-1acf-f40e-ffc841c28118.gif)

[以上！](http://qiita.com/uriuriuriu/items/7be0ed117ab8ae3e7f79#5-%E3%81%A4%E3%81%A3%E3%81%A6%E3%82%82%E9%87%8D%E3%81%8F%E3%81%AA%E3%81%84)