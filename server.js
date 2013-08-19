var restify = require('restify');
var server = restify.createServer({ name: 'my-api' });
var YQL = require('yql');
//var _ = require('underscore');
var JSPath = require('jspath');
 
server.listen(3000, function () {
	console.log('%s listening at %s', server.name, server.url );
});

server.use(restify.fullResponse()).use(restify.bodyParser());

server.get('/prices', function (req, res, next) {
	// SELECT * FROM html WHERE url="http://www.mysupermarket.co.uk/shelves/Nappies_in_ASDA.html?Sort=PPU" and xpath="//*/li[contains(@class,\'MspProductListCell\')]//span[contains(@class,\'ProductName\')]|//*/li[contains(@class,\'MspProductListCell\')]//span[contains(@class,\'ProductName\')]"
	
	new YQL.exec('SELECT * FROM html WHERE url="http://www.mysupermarket.co.uk/shelves/Nappies_in_ASDA.html?Sort=PPU" and xpath="//*/li[contains(@class,\'MspProductListCell\')]"', function(response) {
		var cleanResults = [];
		
		// Need to add logic for struck through prices!!!
		
		response.query.results.li.forEach(function(item){
			cleanResults.push({
				"name": JSPath.apply('..span{.class === "ProductName"}.content[0]',item),
				"qty": JSPath.apply('..span{.class === "NameSuffix"}.content[0]',item),
				"price": JSPath.apply('..span{.class === "priceClass"}.content[0]',item),
				"img": JSPath.apply('..img{.class === "Image"}.src[0]',item),
				"ppu": JSPath.apply('..span{.id === "PPU"}.span{.class === "OldPPU"}.content[0]',item),
				"offer": JSPath.apply('..span..a{.id === "PriceOffer"}.content[0]',item),
				"offerPpu": JSPath.apply('..span{.id === "PPU"}.span{.class ^== "Offer"}.content[0]',item),
			});
		})
		
		res.send(cleanResults);
		//res.send(response);
	});
})
