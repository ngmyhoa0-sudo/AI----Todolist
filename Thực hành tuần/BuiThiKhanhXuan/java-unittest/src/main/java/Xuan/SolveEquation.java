package Xuan;

public class SolveEquation {

    public String linearEquation(int number1, int number2) {
        if (number1 == 0 && number2 == 0) {
            return "Multi roots";
        } else if (number1 == 0) {
            return "No root";
        } else {
            return "One root";
        }
    }
}
