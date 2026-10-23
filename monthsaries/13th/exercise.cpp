#include <iostream>
using namespace std;

class LargestNumberFinder {
private:
    double num1, num2, num3;

public:
    void getInput() {
        cout << "Enter three numbers: ";
        cin >> num1 >> num2 >> num3;
    }

    void findLargest() {
        double largest = num1;

        if (num2 > largest) {
            largest = num2;
        }
        if (num3 > largest) {
            largest = num3;
        }

        cout << "The largest number is: " << largest << endl;
    }
};

int main() {
    LargestNumberFinder finder;
    finder.getInput();
    finder.findLargest();

    return 0;
}