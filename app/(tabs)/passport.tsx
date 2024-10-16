import { Button, ButtonText, ButtonSpinner, ButtonIcon } from '@/components/ui/button';

import { InputIcon, InputSlot } from '@/components/ui/input';
import { SearchIcon } from '@/components/ui/icon';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorIcon, FormControlErrorText } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Accordion, AccordionHeader, AccordionIcon, AccordionItem, AccordionTitleText, AccordionTrigger, AccordionContent, AccordionContentText } from "@/components/ui/accordion";
import { Divider } from "@/components/ui/divider";
import { AlertCircleIcon, ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icon";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableData } from "@/components/ui/table";
import { VStack } from "@/components/ui/vstack";
import { PassportData, getMRZKey, scanPassport } from "@/modules/custom-ios-passport-reader";
import React, { useCallback, useState } from "react";
const _initialMRZData = {
  documentNumber: '',
  dateOfBirth: '',
  dateOfExpiry: ''
};
const MRZDataRegex = {
  documentNumber: /^[A-Z0-9]{8}$/,
  dateOfBirth: /^[0-9]{2}(?:10|11|12|0[1-9])[0-3][1-9]/,
  // YYMMDD format,
  dateOfExpiry: /^[0-9]{2}(?:10|11|12|0[1-9])[0-3][1-9]/
};
const _initialInvalid = {
  documentNumber: false,
  dateOfBirth: false,
  dateOfExpiry: false
};
function MRZForm({
  setMRZKey
}: {
  setMRZKey: (mrzKey: string)=>void;
}) {
  const [mrzData, setMRZData] = React.useState(_initialMRZData);
  const [invalid, setInvalid] = React.useState(_initialInvalid);

  const mrzDataChangeHandler = useCallback((key: string) => (e: any) => {
    setMRZData(prevMRZData => ({
      ...prevMRZData,
      [key]: e.nativeEvent.text
    }));
  }, [setMRZData]);

  const handleSubmit = useCallback(() => {
    let nextInvalid = {..._initialInvalid };
    nextInvalid.documentNumber = !MRZDataRegex.documentNumber.test(mrzData.documentNumber);
    nextInvalid.dateOfBirth = !MRZDataRegex.dateOfBirth.test(mrzData.dateOfBirth);
    nextInvalid.dateOfExpiry = !MRZDataRegex.dateOfExpiry.test(mrzData.dateOfExpiry);
    setInvalid(nextInvalid);
    if (!Object.values(nextInvalid).some(Boolean)) {
      setMRZKey(getMRZKey(mrzData.documentNumber, mrzData.dateOfBirth, mrzData.dateOfExpiry));
    }
  }, [mrzData, setMRZKey, setInvalid]);
  // Create a form to input document number, date of birth, and expiration date

  return <AccordionContentText>
    <VStack className="w-full" space="lg">
      <FormControl isInvalid={invalid.documentNumber} size={"lg"} isRequired>
        <FormControlLabel>
          <FormControlLabelText>Passport Number</FormControlLabelText>
        </FormControlLabel>

        <Input size={"xl"} variant={"outline"} isInvalid={invalid.documentNumber} isRequired className='w-full'>
          <InputField onChange={mrzDataChangeHandler('documentNumber')} value={mrzData.documentNumber} placeholder="XX123456" />
        </Input>

        <FormControlHelper>
          <FormControlHelperText>
            First 8 characters of the passport number. (Pad?)
          </FormControlHelperText>
        </FormControlHelper>

        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>
            Must be 8 uppercase characters letters and numbers.
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      <FormControl isInvalid={invalid.dateOfBirth} size={"lg"} isRequired>
        <FormControlLabel>
          <FormControlLabelText>Date of Birth</FormControlLabelText>
        </FormControlLabel>

        <Input size={"xl"} variant={"outline"} isInvalid={invalid.dateOfBirth} isRequired>
          <InputField onChange={mrzDataChangeHandler('dateOfBirth')} value={mrzData.dateOfBirth} placeholder="YYMMDD" />
        </Input>

        <FormControlHelper>
          <FormControlHelperText>
            Instead of 1990/01/13 write 900113.
          </FormControlHelperText>
        </FormControlHelper>

        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>
            Must be 6 digits in YYMMDD format.
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      <FormControl isInvalid={invalid.dateOfBirth} size={"lg"} isRequired>
        <FormControlLabel>
          <FormControlLabelText>Date of Expiry</FormControlLabelText>
        </FormControlLabel>

        <Input size={"xl"} variant={"outline"} isInvalid={invalid.dateOfExpiry} isRequired>
          <InputField onChange={mrzDataChangeHandler('dateOfExpiry')} value={mrzData.dateOfExpiry} placeholder="YYMMDD" />
        </Input>

        <FormControlHelper>
          <FormControlHelperText>
            Instead of 2030/01/13 write 300113.
          </FormControlHelperText>
        </FormControlHelper>

        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>
            Must be 6 digits in YYMMDD format.
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      <Button action={"primary"} variant={"solid"} size={"xl"} isDisabled={false} onPress={handleSubmit}>
        <ButtonText>Calculate MRZ Key</ButtonText>
      </Button>
    </VStack>
  </AccordionContentText>;
}
function ScannedDataList({
  scannedData
}: {
  scannedData: [string, string][];
}) {
  return <Table className="w-full">
    <TableHeader>
      <TableRow>
        <TableHead>DG</TableHead>
        <TableHead>Data</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {scannedData.map(([dg, data]) => <TableRow key={dg}>
        <TableData>{dg}</TableData>
        <TableData>{data}</TableData>
      </TableRow>)}
    </TableBody>
  </Table>;
}
const _defaultAccordionItem = ['mrz'];
export default function TabPassportScan() {
  const [mrzKey, setMRZKey] = useState("");
  const [scannedData, setScannedData] = useState<[string, string][]>([]);
  const [openpassportData, setOpenPassportData] = useState<object>({});
  const handlePassportScanned = useCallback(async ({
    openpassport,
    ...nextScannedData
  }: PassportData) => {
    setScannedData(Object.entries(nextScannedData).sort(([a], [b]) => a.localeCompare(b)));
    try {
      const nextOpenpassportData = JSON.parse(openpassport);
      setOpenPassportData(nextOpenpassportData);
    } catch (err) {
      console.log(err);
    }
  }, [setScannedData, setOpenPassportData]);
  return <Accordion size="lg" variant="filled" type="single" isCollapsible defaultValue={_defaultAccordionItem}>
    <AccordionItem value="mrz">
      <AccordionHeader>
        <AccordionTrigger>
          {({
            isExpanded
          }) => <>
              <AccordionTitleText>
                MRZ Key: {mrzKey}
              </AccordionTitleText>
              <AccordionIcon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} className="ml-3" />
            </>}
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>
        <MRZForm setMRZKey={setMRZKey} />
      </AccordionContent>
    </AccordionItem>
    <Divider />
    <AccordionItem value="scannedData" isDisabled={!scannedData}>
      <AccordionHeader>
        <AccordionTrigger>
          {({
            isExpanded
          }) => <>
              <AccordionTitleText>
                ScannedData: {scannedData.map(a => a[0]).join(', ')}
              </AccordionTitleText>
              <AccordionIcon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} className="ml-3" />
            </>}
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>
        <ScannedDataList scannedData={scannedData} />
      </AccordionContent>
    </AccordionItem>
  </Accordion>;
}