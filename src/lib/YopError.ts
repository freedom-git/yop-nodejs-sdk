export class YopError {
    public $code;
    public $message;
    public $subCode;
    public $subMessage;
    private $name;

    public __set($name, $value) {
        this.$name = $value;
    }

    public __get($name) {
        return this.$name;
    }
}
