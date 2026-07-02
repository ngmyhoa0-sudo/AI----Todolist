package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.SolveEquation;

public class SolveEquationTest {

    private final SolveEquation solveEquation = new SolveEquation();

    @Test
    void testMultiRoots() {
        assertEquals("Multi roots", solveEquation.linearEquation(0, 0));
    }

    @Test
    void testNoRoot() {
        assertEquals("No root", solveEquation.linearEquation(0, 5));
    }

    @Test
    void testOneRoot() {
        assertEquals("One root", solveEquation.linearEquation(3, 7));
    }
}
