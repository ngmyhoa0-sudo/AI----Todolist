package Xuan;

public class Advance2 {

    public long sum(long number) {
        number = Math.abs(number);
        long total = 0;
        while (number != 0) {
            total += number % 10;
            number /= 10;
        }
        return total;
    }
}
