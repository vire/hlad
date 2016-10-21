const fs: any = jest.genMockFromModule('fs');

fs.readdir = function(somePath, cb) {
  cb(null, ['aFileName'])
};
fs.readFile = function(pathToFile, encoding, cb) {
  cb(null, '{\n  "name": "Foo place",\n  "content": ""\n}\n')
};

module.exports = fs;
