package Xuan;

public class MaxNumber2 {

    private int number1;
    private int number2;

    public MaxNumber2(int number1, int number2) {
        this.number1 = number1;
        this.number2 = number2;
    }

    public int max2() {
        return number1 > number2 ? number1 : number2;
    }
}
