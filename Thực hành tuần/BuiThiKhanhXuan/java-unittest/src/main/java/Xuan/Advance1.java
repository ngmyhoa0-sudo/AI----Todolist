package Xuan;

public class Advance1 {

    public int USCLN(int a, int b) {
        if (a <= 0 || b <= 0) {
            throw new IllegalArgumentException("a and b must be positive");
        }
        while (a != b) {
            if (a > b) {
                a = a - b;
            } else {
                b = b - a;
            }
        }
        return a;
    }

    public int BSCNN(int a, int b) {
        return (a * b) / USCLN(a, b);
    }
}
